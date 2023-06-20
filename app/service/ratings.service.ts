import { injectable } from 'tsyringe';
import { ErrnoException, ISuccess } from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';
import { IRequest } from '../common/Interface/IResponse';
import Ratings from '../model/ratings.model';
import { Types } from 'mongoose';
import Booking from '../model/booking.model';
import StatusCodes from '../lib/response/status-codes';
import { IRatings } from '../model/interface/IRatings';
import PaginationService from './pagination.service';
import User from '../model/user.model';

@injectable()
export class RatingsService {
  pagination: PaginationService<IRatings>;

  private populateQuery = [
    {
      path: 'merchant',
      select:
        '_id firstName lastName state country rate profilePicture dateOfBirth experience childcareCertified gardaCheck',
    },
    {
      path: 'customer',
      select: '_id firstName lastName state country address profilePicture',
    },
    {
      path: 'booking',
      select:
        '_id bookingStatus merchantRequest customerRequest actualEndDate actualStartDate startDate endDate',
    },
  ];

  constructor() {
    this.pagination = new PaginationService(Ratings);
  }
  public addRatings = async (req: IRequest): Promise<ISuccess | ErrnoException> => {
    const { merchant, booking, comment, ratingScore } = req.body;
    const bookingData = await Booking.findOne({
      _id: new Types.ObjectId(booking),
    });

    if (!bookingData)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        `Booking does not exist`
      );
    await Ratings.findOneAndUpdate(
      { booking },
      {
        $set: {
          booking: new Types.ObjectId(booking),
          customer: new Types.ObjectId(req.user.id),
          merchant: new Types.ObjectId(merchant),
          comment,
          ratingScore: Number(ratingScore),
        },
      },
      { upsert: true, new: true }
    );

    await Booking.findOneAndUpdate(
      { _id: new Types.ObjectId(booking) },
      {
        customerRated: true,
      },
      { upsert: true, new: true }
    );
    return Helpers.success(null);
  };

  public getMerchantReviews = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { merchant } = req.params;

    const query = {};
    query['merchant'] = { $eq: new Types.ObjectId(merchant) };
    query['resolved'] = { $eq: true };
    query['sort'] = { updatedAt: 'desc' };
    query['populate'] = this.populateQuery;
    const response = await this.pagination.paginate(query);

    return Helpers.success(response);
  };

  async updateMerchantRatings(page = 1) {
    // loop through all ratings not marked as resolved

    const query = {};
    query['resolved'] = { $eq: false };
    query['page'] = page;
    query['limit'] = 20;
    const result = await this.pagination.paginate<IRatings>(query, []);

    // for each item in the array, make decision based on the status of ratings
    for (const item of result.data) {
      const rating = await Ratings.findByIdAndUpdate(
        item._id,
        { resolved: true },
        { new: true }
      );

      const merchant = await User.findById(item.merchant);

      // update the reviewCount and averageRatings of the merchant based on the new rating
      merchant.ratings.reviewCount += 1;
      const averageRatings =
        (merchant.ratings.averageRatings * (merchant.ratings.reviewCount - 1) +
          rating.ratingScore) /
        merchant.ratings.reviewCount;
      merchant.ratings.averageRatings = Number(
        (Math.round(averageRatings * 2) / 2).toFixed(1)
      );

      await merchant.save();
    }

    if (result.meta.page < result.meta.pages) {
      await this.updateMerchantRatings(page + 1);
    }
  }
}
