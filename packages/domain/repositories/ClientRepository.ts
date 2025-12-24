import { Client } from '@domain/entities/Client.entity';

export interface ClientRepository {
    // Tek kayıt bulma
    findById(id: string): Promise<Client | null>;

    // Email ile bulma
    findByEmail(email: string): Promise<Client | null>;

    // Dietitian’a bağlı tüm client’lar
    findByDietitianId(
        dietitianId: string,
        options?: { isActive?: boolean; skip?: number; take?: number }
    ): Promise<Client[]>;

    // Arama (isim, soyisim, email)
    search(
        query: string,
        dietitianId?: string,
        options?: { skip?: number; take?: number }
    ): Promise<Client[]>;

    // Sayım
    count(filters?: { dietitianId?: string; isActive?: boolean }): Promise<number>;

    // Email var mı kontrolü
    existsByEmail(email: string): Promise<boolean>;

    // Kaydetme (create/update)
    save(client: Client): Promise<Client>;

    // Silme (soft delete)
    delete(id: string): Promise<void>;
}
