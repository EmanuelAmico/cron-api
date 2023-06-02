import { formatTime, formatDate } from "@helpers";
import {
  CourseTag,
  ICourse,
  ICourseInformation,
  IEmailTemplates,
} from "@types";

const emailMapper: {
  [key in Exclude<
    CourseTag,
    "BC_JAVASCRIPT" | "BC_SALESFORCE"
  >]: IEmailTemplates;
} = {
  INTRO_JAVASCRIPT: "intro_live",
  INTRO_JAVASCRIPT_ATR: "intro_atr",
};

export const createEmailParams = (
  course: ICourse,
  tag: Exclude<CourseTag, "BC_JAVASCRIPT" | "BC_SALESFORCE">
) => {
  const { shift, weekDays, startDate, endDate, startHour, endHour, mode } =
    course;

  const commissionCourseInfo = {
    hours: `De ${formatTime(startHour)} a ${formatTime(endHour)}`,
    startDate: formatDate(new Date(startDate)),
    endDate: formatDate(new Date(endDate)),
    weekDays,
    shift,
  } as ICourseInformation;

  const emailParams = {
    course: commissionCourseInfo,
    template: emailMapper[tag],
    modality: mode,
    price: 0,
  };

  return emailParams;
};
