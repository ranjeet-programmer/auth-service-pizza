import { DataSource } from 'typeorm';

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas; // getting all entities list

    // iterate over each entitie and clear it

    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

export const isJWT = (token: string | null): boolean => {
    if (token === null) {
        return false;
    }

    const parts = token.split('.');

    if (parts.length != 3) {
        return false;
    }

    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf8');
        });

        return true;
    } catch (err) {
        return false;
    }
};
