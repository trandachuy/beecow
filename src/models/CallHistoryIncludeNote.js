/**
 @typedef CallHistoryIncludeNote
 @type {{
  *     id: number,
  *     duration: number,
  *     storeId: number,
  *     customerId: number,
  *     customerName: string,
  *     toNumberPhone: string,
  *     status: {("SUCCESSFUL"|"DECLINED"|"NON_SUCCESSFUL")},
  *     type: {("OUTBOUND"|"INBOUND")},
  *     recordingUrl: string,
  *     fromExtension: number,
  *     callBy: string,
  *     callById: number,
  *     callId: number,
  *     timeStarted: string,
  *     timeEnd: string
  *     comments: {CallHistoryNoteModel[]}
 }}
*/
