import { Model } from 'mongoose';
import { injectable } from 'tsyringe';
import Constants from '../lib/constants';
import { Pagination, PaginationOptions } from '../model/interface/pagination.entity';

@injectable()
export default class PaginationService<T> {
  constructor(model: Model<T>) {
    this.model = model;
  }
  model: Model<T>;

  /**
   * parse query
   * @param  {string} parameters
   * @return {object}
   */
  static extractQuery = (parameters: object, fields: string[] = []) => {
    if (parameters == null) return null;

    const query: Record<string, unknown> = {};
    for (const element in parameters) {
      if (fields.includes(element)) {
        const val: any = parameters[element];

        query[element] = val;
      }
    }
    return query;
  };

  /**
   *
   * @param {PaginationOptions}  options
   * @param {string[]}  keys - keys to extract from request query parameter
   */
  async paginate<T>(
    options: PaginationOptions,
    keys?: string[],
    select?: object
  ): Promise<Pagination<T>> {
    const {
      page,
      limit,
      projections,
      sort,
      // query,
      populate,
    } = options;
    const query: Record<string, unknown> = {
      ...options,
      ...PaginationService.extractQuery(options, keys),
    };
    const p = Number(page) || Constants.FETCH_DATA_DEFAULT_PAGE_NUMBER;
    const pp = Number(limit) || Constants.FETCH_DATA_MIN_LIMIT;
    const result = await Promise.allSettled([
      this.model.countDocuments(query),
      this.model
        .find(query, projections)
        .skip(pp * (p - 1))
        .limit(pp)
        .sort(sort)
        .populate(populate)
        .lean()
        .select({ ...select })
        .exec(),
    ]);

    let status = 'success';
    if (result[0]?.status == 'rejected' || result[1]?.status == 'rejected')
      status = 'error';

    let first: PromiseFulfilledResult<number>;
    let second: PromiseFulfilledResult<any>;
    if (result[0].status == 'fulfilled') first = result[0];
    if (result[1].status == 'fulfilled') second = result[1];
    const total = first?.value || 0;
    const pages = Math.ceil(total / pp);
    return {
      data: second ? second?.value || [] : [],
      meta: {
        pages,
        prev: p > 1,
        next: p < pages && pages > 0,
        total,
        page: p,
        // sort: ,
        limit: pp,
      },
      status,
    };
  }
}
