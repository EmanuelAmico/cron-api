import httpStatusCodes from "./HTTP/httpCodes";
import ServiceError from "./Services/serviceErrors";

const handleServiceErrors = (err: ServiceError) => {
  switch (err.internalError) {
    case 1:
      err.status = httpStatusCodes.NOT_FOUND;
      break;
    case 2:
      err.status = httpStatusCodes.UNAUTHORIZED;
      break;
    case 3:
      err.status = httpStatusCodes.UNAUTHORIZED;
      break;
    case 4:
      err.status = httpStatusCodes.BAD_REQUEST;
      break;
  }
};

export default handleServiceErrors;
