import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AddressService } from '../services/address.service';
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
} from '../validators/address.validator';

export class AddressController {
  /**
   * Creates a new address for customer (Customer).
   * POST /api/v1/addresses
   */
  static createAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const input = createAddressSchema.parse(req.body);
    const address = await AddressService.createAddress(userId, input);

    return ApiResponse.success(res, 'Address created successfully', address, 201);
  });

  /**
   * Retrieves all saved addresses for customer (Customer).
   * GET /api/v1/addresses
   */
  static getUserAddresses = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const addresses = await AddressService.getUserAddresses(userId);

    return ApiResponse.success(res, 'Addresses retrieved successfully', addresses);
  });

  /**
   * Retrieves a specific address by ID (Customer).
   * GET /api/v1/addresses/:id
   */
  static getAddressById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = addressIdParamSchema.parse(req.params);
    const address = await AddressService.getAddressById(userId, id);

    return ApiResponse.success(res, 'Address retrieved successfully', address);
  });

  /**
   * Updates an existing customer address (Customer).
   * PATCH /api/v1/addresses/:id
   */
  static updateAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = addressIdParamSchema.parse(req.params);
    const input = updateAddressSchema.parse(req.body);
    const address = await AddressService.updateAddress(userId, id, input);

    return ApiResponse.success(res, 'Address updated successfully', address);
  });

  /**
   * Deletes a customer address (Customer).
   * DELETE /api/v1/addresses/:id
   */
  static deleteAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = addressIdParamSchema.parse(req.params);
    const result = await AddressService.deleteAddress(userId, id);

    return ApiResponse.success(res, 'Address deleted successfully', result);
  });

  /**
   * Sets an address as default for customer (Customer).
   * PATCH /api/v1/addresses/:id/default
   */
  static setDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = addressIdParamSchema.parse(req.params);
    const address = await AddressService.setDefaultAddress(userId, id);

    return ApiResponse.success(res, 'Address set as default successfully', address);
  });
}
