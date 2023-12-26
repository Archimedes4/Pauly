export default function convertICSToString(icalStr)  {
  // icalStr = '20110914T184000Z'             
  var strYear = icalStr.substr(0,4);
  var strMonth = parseInt(icalStr.substr(4,2),10)-1;
  var strDay = icalStr.substr(6,2);
  var strHour = icalStr.substr(9,2);
  var strMin = icalStr.substr(11,2);
  var strSec = icalStr.substr(13,2);

  var oDate =  new Date(strYear,strMonth, strDay, strHour, strMin, strSec)

  return oDate.toISOString();
}