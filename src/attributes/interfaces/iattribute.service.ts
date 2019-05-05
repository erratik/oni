import { AttributeSchemaDto } from '../../attributes/dto/attributes.dto';
import { IAttribute } from './attribute.schema';

export interface IAttributeService {
  addAttribute(attribute: AttributeSchemaDto): Promise<IAttribute | null>;
  addAttributes(attributes: AttributeSchemaDto[]): Promise<void>;
  deleteAttributes(id: string): Promise<any>;
}
