import moment from 'moment-timezone';
import { extendMoment } from 'moment-range';
import "moment/locale/en-gb"
import "moment/locale/hy-am"
moment.locale('hy', {
  months : "հունվար_փետրվար_մարտ_ապրիլ_մայիս_հունիս_հուլիս_օգոստոս_սեպտեմբեր_հոկտեմբեր_նոյեմբեր_դեկտեմբեր".split("_"),
  monthsShort : "հուն._փետր._մար․_ապր._մայ․_հուն․_հուլ._օգոս․_սեպտ._հոկտ._նոյ._դեկտ.".split("_"),
  weekdays : "Կիրակի_Երկուշաբթի_Երեքշաբթի_Չորեքշաբթի_Հինգշաբթի_Ուրբաթ_Շաբաթ".split("_"),
  weekdaysShort : "Կիր․_Երկ․_Երք․_Չրք․_Հնգ․_Ուրբ․_Շբթ․".split("_"),
  weekdaysMin : "Կիր_Երկ_Երք_Չրք_Հնգ_Ուրբ_Շբթ".split("_"),
  longDateFormat : {
    LT : "HH:mm",
    LTS : "HH:mm:ss",
    L : "DD/MM/YYYY",
    LL : "D MMMM YYYY",
    LLL : "D MMMM YYYY LT",
    LLLL : "dddd D MMMM YYYY LT"
  },
  relativeTime : {
    s : "վ",
    m : "ր",
    h : "ժ",
    d : "օր",
    M : "ամիս",
    y : "տարի",
  },
  ordinalParse : /\d{1,2}(er|ème)/,
  ordinal : function (number) {
    return number + (number === 1 ? 'er' : 'ème');
  },
  meridiemParse: /PD|MD/,
  isPM: function (input) {
    return input.charAt(0) === 'M';
  },

  meridiem : function (hours, minutes, isLower) {
    return hours < 12 ? 'PD' : 'MD';
  },
  week : {
    dow : 1, // Monday is the first day of the week.
  }
});

export default extendMoment(moment);
