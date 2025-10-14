public with sharing class ActivityCalendarController {
    @AuraEnabled(cacheable=true)
    public static List<BCAC_ActivityController.ActivityItem> getActivities(Id recordId, Date startDate, Date endDate, List<String> types) {
        return BCAC_ActivityController.getActivities(recordId, startDate, endDate, types);
    }
}
