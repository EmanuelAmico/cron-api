import httpStatusCodes from "./HTTP/httpCodes";
import ServiceError from "./Services/serviceErrors";

const handleServiceErrors = (error: ServiceError) => {
  switch (error.internalError) {
    case 1:
      error.status = httpStatusCodes.NOT_FOUND;
      break;
    case 2:
      error.status = httpStatusCodes.UNAUTHORIZED;
      break;
    case 3:
      error.status = httpStatusCodes.UNAUTHORIZED;
      break;
    case 4:
      error.status = httpStatusCodes.BAD_REQUEST;
      break;
  }
};

export default handleServiceErrors;
