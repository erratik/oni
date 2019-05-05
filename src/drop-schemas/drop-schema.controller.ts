import { Controller, Get, UseGuards, Response, Param, Query, HttpStatus, Delete, Body, Req, Post, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DropSchemaService } from './drop-schema.service';
import { ApiUseTags } from '@nestjs/swagger';
import { DropSchemaDto } from './dto/drop-schema.dto';
import { AttributeService } from '../attributes/attributes.service';
import { DropKeyDto } from '../drop/dto/drop-key.dto';
import { IDropKey } from './interfaces/drop-schema.schema';

@ApiUseTags('schemas')
@Controller('v1/schemas')
export class DropSchemaController {
  constructor(private readonly dropSchemaService: DropSchemaService, private readonly attributeService: AttributeService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getDropSchemas(@Param() param, @Query() query, @Req() req, @Response() res) {
    return await this.dropSchemaService.getDropSchemas({ owner: req.user.username }).then(dropSchemas => {
      if (!dropSchemas) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No drop schemas found with query ${JSON.stringify(query)}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(dropSchemas);
      }
    });
  }

  @Get(':space')
  @UseGuards(AuthGuard('jwt'))
  async getStandardDropSchemas(@Param() param, @Query() query, @Req() req, @Response() res) {
    query.owner = req.user.username;
    return await this.dropSchemaService.getDropSchemas(Object.assign(query, param)).then(dropSchemas => {
      if (!dropSchemas) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No drop schema for ${param.space}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(dropSchemas);
      }
    });
  }

  @Put(':space')
  @UseGuards(AuthGuard('jwt'))
  async updateSpaceSchema(@Param() param, @Response() res, @Req() req, @Body() dropSchemaDto: DropSchemaDto) {
    const fields = {
      owner: req.user.username,
      space: param.space,
      type: dropSchemaDto.type ? dropSchemaDto.type : 'default',
    };

    // todo : put this in a service
    // get attributes from keyMap and populate dropKey, update if needed
    if (dropSchemaDto.keyMap) {
      await this.attributeService.getAttributes({ _id: { $in: dropSchemaDto.keyMap.map(({ attribute }) => attribute) } }).then(attributes => {
        dropSchemaDto.keyMap = dropSchemaDto.keyMap.map((dropKey: DropKeyDto, i) => {
          const attribute = attributes.find(({ id }) => dropKey.attribute === id);
          if (dropKey.broadcast && dropSchemaDto.keyMap[i] === 'displayName') {
            this.attributeService.updateAttribute({ _id: dropKey.attribute }, { displayName: dropKey.displayName });
          }
          return { ...dropKey, format: attribute.type, path: attribute.path };
        });
      });
    }

    const updatedSchema: DropSchemaDto = {
      ...fields,
      keyMap: dropSchemaDto.keyMap.map(dropKey => {
        delete dropKey.broadcast;
        delete dropKey.attribute;
        return dropKey;
      }),
    };

    return await this.dropSchemaService.upsertDropSchema(updatedSchema).then(dropSchema => res.status(HttpStatus.OK).json(dropSchema));
  }

  // @Delete('dropSchemas')
  // @UseGuards(AuthGuard('jwt'))
  // async deleteDropSchemas(@Param() param, @Response() res, @Body() body, @Query() query) {
  //   debugger;
  //   return await this.dropSchemaService.deleteDropSchemas(body).then(dropSchemas => {
  //     debugger;
  //     if (!dropSchemas) {
  //       res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //         message: `No dropSchema for ${param.space}`,
  //       });
  //     } else {
  //       return res.status(HttpStatus.OK).json(dropSchemas);
  //     }
  //   });
  // }
}
