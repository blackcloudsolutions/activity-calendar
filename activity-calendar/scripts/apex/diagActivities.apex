Id rid;

// Try Account with Task
List<AggregateResult> rs = [
  SELECT WhatId r, COUNT(Id) c FROM Task WHERE WhatId != null GROUP BY WhatId ORDER BY COUNT(Id) DESC LIMIT 1
];
if (!rs.isEmpty()) rid = (Id) rs[0].get('r');

// Fallback: Account with Event
if (rid == null) {
  List<AggregateResult> er = [
    SELECT WhatId r, COUNT(Id) c FROM Event WHERE WhatId != null GROUP BY WhatId ORDER BY COUNT(Id) DESC LIMIT 1
  ];
  if (!er.isEmpty()) rid = (Id) er[0].get('r');
}

// Fallback: RelatedTo for EmailMessage
if (rid == null) {
  List<AggregateResult> mr = [
    SELECT RelatedToId r, COUNT(Id) c FROM EmailMessage WHERE RelatedToId != null GROUP BY RelatedToId ORDER BY COUNT(Id) DESC LIMIT 1
  ];
  if (!mr.isEmpty()) rid = (Id) mr[0].get('r');
}

System.debug('RID=' + rid);

if (rid != null) {
  List<String> t = new List<String>{'Task','Call','Event','Email'};
  List<BCAC_ActivityController.ActivityItem> items = BCAC_ActivityController.getActivities(rid, null, null, t);
  System.debug('SIZE=' + items.size());
  Integer shown = 0;
  for (BCAC_ActivityController.ActivityItem i : items) {
    System.debug('ROW: ' + i.type + ' | ' + i.subject + ' | ' + i.whenAt);
    shown++;
    if (shown >= 10) break;
  }
} else {
  System.debug('No related activities found in this org.');
}
