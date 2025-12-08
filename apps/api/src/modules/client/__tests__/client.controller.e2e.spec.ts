import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { JwtService } from '@nestjs/jwt';

describe('ClientController (e2e)', () => {
    let app: INestApplication;
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

        jwtService = moduleFixture.get<JwtService>(JwtService);

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

    describe('/api/v1/clients (GET)', () => {
        it('should return 401 without authentication', () => {
            return request(app.getHttpServer())
                .get('/api/v1/clients')
                .expect(401);
        });

        it('should return clients for dietitian', () => {
            return request(app.getHttpServer())
                .get('/api/v1/clients')
                .set('Authorization', `Bearer ${dietitianToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it('should return all clients for admin', () => {
            return request(app.getHttpServer())
                .get('/api/v1/clients')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });
    });

    describe('/api/v1/clients (POST)', () => {
        const createClientDto = {
            firstName: 'Test',
            lastName: 'Client',
            email: 'testclient@example.com',
            phone: '+1234567890',
            dateOfBirth: '1990-01-15',
            gender: 'MALE',
        };

        it('should create client for dietitian', () => {
            return request(app.getHttpServer())
                .post('/api/v1/clients')
                .set('Authorization', `Bearer ${dietitianToken}`)
                .send(createClientDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body.firstName).toBe(createClientDto.firstName);
                    expect(res.body.email).toBe(createClientDto.email);
                });
        });

        it('should return 422 for invalid email', () => {
            return request(app.getHttpServer())
                .post('/api/v1/clients')
                .set('Authorization', `Bearer ${dietitianToken}`)
                .send({ ...createClientDto, email: 'invalid' })
                .expect(422);
        });

        it('should return 422 for missing required fields', () => {
            return request(app.getHttpServer())
                .post('/api/v1/clients')
                .set('Authorization', `Bearer ${dietitianToken}`)
                .send({ firstName: 'Test' })
                .expect(422);
        });
    });

    describe('/api/v1/clients/:id (GET)', () => {
        it('should return 404 for non-existent client', () => {
            return request(app.getHttpServer())
                .get('/api/v1/clients/non-existent-id')
                .set('Authorization', `Bearer ${dietitianToken}`)
                .expect(404);
        });
    });

    describe('/api/v1/clients/:id/metrics (POST)', () => {
        const metricsDto = {
            weight: 75.5,
            height: 175,
            bodyFat: 18.5,
            waist: 80,
            hip: 95,
            notes: 'Regular checkup',
        };

        it('should return 404 for non-existent client', () => {
            return request(app.getHttpServer())
                .post('/api/v1/clients/non-existent-id/metrics')
                .set('Authorization', `Bearer ${dietitianToken}`)
                .send(metricsDto)
                .expect(404);
        });
    });
});
