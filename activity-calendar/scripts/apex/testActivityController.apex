Id accId = [SELECT Id FROM Account WHERE Name = 'Activity Calendar Demo' LIMIT 1].Id;
List<String> t = new List<String>{'Task','Call','Event','Email'};
List<BCAC_ActivityController.ActivityItem> items = BCAC_ActivityController.getActivities(accId, null, null, t);
System.debug('=== BCAC getActivities size = ' + items.size());
for (BCAC_ActivityController.ActivityItem i : items) {
    System.debug('TYPE=' + i.type + ' SUBJECT=' + i.subject + ' WHEN=' + i.whenAt);
}
