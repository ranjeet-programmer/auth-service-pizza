import { DataSource } from 'typeorm';

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas; // getting all entities list

    // iterate over each entitie and clear it

    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};
