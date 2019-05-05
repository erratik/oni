import { Controller, Get, UseGuards, Response, Param, Query, HttpStatus, Delete, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AttributeService } from './attributes.service';
import { ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('attributes')
@Controller('v1/attributes')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getAttributes(@Query() query, @Response() res) {
    debugger;
    return await this.attributeService.getAttributes(query).then(attributes => {
      if (!attributes) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No attributes found with query ${JSON.stringify(query)}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(attributes);
      }
    });
  }

  @Get('attributes/:space')
  @UseGuards(AuthGuard('jwt'))
  async getStandardAttributes(@Param() param, @Query() query, @Response() res) {
    query = Object.assign(query, param);
    return await this.attributeService.getAttributes(query).then(attributes => {
      if (!attributes) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No attribute for ${param.space}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(attributes);
      }
    });
  }

  @Delete('attributes')
  @UseGuards(AuthGuard('jwt'))
  async deleteAttributes(@Param() param, @Response() res, @Body() body, @Query() query) {
    debugger;
    return await this.attributeService.deleteAttributes(body).then(attributes => {
      debugger;
      if (!attributes) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No attribute for ${param.space}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(attributes);
      }
    });
  }

  // @Get('fetch/:space')
  // @UseGuards(AuthGuard('jwt'))
  // async fetchAttributes(@Param() param, @Req() req, @Response() res, @Query() query) {
  //   const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);

  //   // fetch attributes
  //   query.consumed = true;

  // add fields
  // const attributes: IAttributeItem[] = response[xPath[param.space]].map((item: IAttributeItem) => {
  //   item.owner = req.user.username;
  //   item.space = param.space;

  //   if (!item.id) {
  //     switch (item.space) {
  //       case Sources.Spotify:
  //         item.id = item['track'].id;
  //         break;
  //       default:
  //         item.id = btoa(Math.random());
  //     }
  //   }
  //   return item;
  // });

  // // save the attributes and add them to their attribute set
  // const updatedAttributeSet = await this.attributeService.addAttributes(attributes).then(attributeSet => attributeSet);

  // // return the saved attribute set
  // return res.status(HttpStatus.OK).json(updatedAttributeSet);
  // }
}
