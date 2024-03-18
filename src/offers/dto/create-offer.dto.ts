import { PartialType } from '@nestjs/swagger';
import { OfferDto } from './offer.dto';

export class CreateOfferDto extends PartialType(OfferDto) {}
