import { DeepPartial, DeleteResult, FindManyOptions, FindOneOptions, FindOptionsWhere, In, InsertResult, Repository, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class BaseService<T> {
  constructor(private readonly repository: Repository<T>) {}

  // Get
  async findAll(opts?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(opts);
  }

  async findOneById(id: number, opts?: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as any,
      ...opts
    });
  }

  async findOne(opts: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(opts);
  }

  async findByIds(ids: number[], opts?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find({
      where: { id: In(ids) } as any,
      ...opts
    });
  }

  async findByFields<K extends keyof T>(field: K, values: T[K][], opts?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find({
      where: { [field]: In(values) } as any,
      ...opts
    });
  }

  async findAndCount(opts?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.repository.findAndCount(opts);
  }

  // Count
  async countBy(opts?: FindManyOptions<T>): Promise<number> {
    return this.repository.count(opts);
  }

  // Save - Create
  async saveMany(data: DeepPartial<T>[]): Promise<T[]> {
    return this.repository.save(data);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    return this.repository.save(data);
  }

  async createMany(data: DeepPartial<T>[]): Promise<T[]> {
    return this.repository.save(data);
  }

  // Upsert
  async upsertBy(data: QueryDeepPartialEntity<T>, conflictPaths: (keyof T)[]): Promise<T> {
    const result = await this.repository.upsert(data, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: conflictPaths as string[]
    });

    return result.generatedMaps[0] as T;
  }

  async upsertManyBy(data: QueryDeepPartialEntity<T>[], conflictPaths: (keyof T)[]): Promise<T[]> {
    const result = await this.repository.upsert(data, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: conflictPaths as string[]
    });

    return result.generatedMaps as T[];
  }

  // Update
  async updateById(id: number, data: QueryDeepPartialEntity<T>): Promise<UpdateResult> {
    return this.repository.update(id, data);
  }

  async updateBy(cond: FindOptionsWhere<T>, data: QueryDeepPartialEntity<T>): Promise<UpdateResult> {
    return this.repository.update(cond as any, data);
  }

  async updateAndFindOneById(id: number, data: QueryDeepPartialEntity<T>, opts?: FindOneOptions<T>): Promise<T | null> {
    await this.updateById(id, data);
    return this.findOneById(id, opts);
  }

  // Delete
  async deleteById(id: number): Promise<DeleteResult> {
    return this.repository.delete(id);
  }

  async deleteBy(cond: FindOptionsWhere<T>): Promise<DeleteResult> {
    return this.repository.delete(cond);
  }

  // Soft delete
  async softDeleteById(id: number): Promise<UpdateResult> {
    return this.repository.softDelete(id);
  }

  async softDeleteByIds(ids: number[]): Promise<UpdateResult> {
    return this.repository.softDelete(ids);
  }

  async softDeleteBy(cond: FindOptionsWhere<T>): Promise<UpdateResult> {
    return this.repository.softDelete(cond);
  }

  // Restore soft deleted
  async restoreById(id: number): Promise<UpdateResult> {
    return this.repository.restore(id);
  }

  async restoreBy(cond: FindOptionsWhere<T>): Promise<UpdateResult> {
    return this.repository.restore(cond);
  }
}
