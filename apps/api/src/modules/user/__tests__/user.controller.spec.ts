import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaClient;
    let jwtService: JwtService;
    let adminToken: string;
    let dietitianToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        app.setGlobalPrefix('api/v1');

        await app.init();

        prisma = moduleFixture.get<PrismaClient>(PrismaClient);
        jwtService = moduleFixture.get<JwtService>(JwtService);

        // Generate test tokens
        adminToken = jwtService.sign({
            sub: 'admin-user-id',
            email: 'admin@test.com',
            role: 'ADMIN',
        });

        dietitianToken = jwtService.sign({
            sub: 'dietitian-user-id',
            email: 'dietitian@test.com',
            role: 'DIETITIAN',
        });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/v1/users (GET)', () => {
        it('should return 401 without authentication', () => {
            return request(app.getHttpServer())
                .get('/api/v1/users')
                .expect(401);
        });

        it('should return 403 for non-admin users', () => {
            return request(app.getHttpServer())
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${dietitianToken}`)
                .expect(403);
        });

        it('should return users list for admin', () => {
            return request(app.getHttpServer())
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });
    });

    describe('/api/v1/users (POST)', () => {
        const createUserDto = {
            email: 'newuser@test.com',
            password: 'Test123!@#',
            firstName: 'Test',
            lastName: 'User',
            role: 'DIETITIAN',
        };

        it('should return 403 for non-admin users', () => {
            return request(app.getHttpServer())
                .post('/api/v1/users')
                .set('Authorization', `Bearer ${dietitianToken}`)
                .send(createUserDto)
                .expect(403);
        });

        it('should create user for admin', () => {
            return request(app.getHttpServer())
                .post('/api/v1/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createUserDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body.email).toBe(createUserDto.email);
                    expect(res.body.firstName).toBe(createUserDto.firstName);
                    expect(res.body.role).toBe(createUserDto.role);
                    expect(res.body).not.toHaveProperty('password');
                });
        });

        it('should return 422 for invalid email', () => {
            return request(app.getHttpServer())
                .post('/api/v1/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...createUserDto, email: 'invalid-email' })
                .expect(422);
        });
    });

    describe('/api/v1/users/:id (GET)', () => {
        it('should return user by ID', () => {
            return request(app.getHttpServer())
                .get('/api/v1/users/admin-user-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBeDefined();
                });
        });

        it('should return 404 for non-existent user', () => {
            return request(app.getHttpServer())
                .get('/api/v1/users/non-existent-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });

    describe('/api/v1/users/me/profile (GET)', () => {
        it('should return current user profile', () => {
            return request(app.getHttpServer())
                .get('/api/v1/users/me/profile')
                .set('Authorization', `Bearer ${dietitianToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.email).toBe('dietitian@test.com');
                });
        });
    });
});
