export enum LogFormats {
  DefaultFormat = '[:date[iso]] [INFO] :ip :method :url :status :res[content-length] :response-time ms',
  ErrorLogFormat = '[:date[iso]] [ERROR] :ip :method :url :status :res[content-length] :response-time ms :responseBody',
}
