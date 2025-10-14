public with sharing class BCAC_ActivityController {
    public class ActivityItem {
        @AuraEnabled public Id id;
        @AuraEnabled public String type;      // Task | Call | Event | Email
        @AuraEnabled public String subject;
        @AuraEnabled public Datetime whenAt;
    }

    @AuraEnabled(cacheable=true)
    public static List<ActivityItem> getActivities(
        Id recordId,
        Date startDate,
        Date endDate,
        List<String> types
    ) {
        // Only require recordId + types
        if (recordId == null || types == null || types.isEmpty()) {
            return new List<ActivityItem>();
        }

        // Flags
        Boolean wantTask  = types.contains('Task');
        Boolean wantCall  = types.contains('Call');
        Boolean wantEvent = types.contains('Event');
        Boolean wantEmail = types.contains('Email');

        // Build date filters only if both dates provided
        String taskDateFilter   = (startDate != null && endDate != null)
            ? ' AND ActivityDate >= :startDate AND ActivityDate <= :endDate'
            : '';

        Datetime startDt, endDt; // for Event/EmailMessage
        String eventDateFilter  = '';
        String emailDateFilter  = '';
        if (startDate != null && endDate != null) {
            startDt = Datetime.newInstance(startDate.year(), startDate.month(), startDate.day());
            endDt   = Datetime.newInstance(endDate.year(),   endDate.month(),   endDate.day()).addDays(1).addSeconds(-1);
            eventDateFilter =
                ' AND ( (IsAllDayEvent = false AND StartDateTime >= :startDt AND StartDateTime <= :endDt)' +
                '    OR (IsAllDayEvent = true  AND ActivityDate   >= :startDate AND ActivityDate   <= :endDate) )';
            emailDateFilter =
                ' AND MessageDate >= :startDt AND MessageDate <= :endDt';
        }

        List<ActivityItem> out = new List<ActivityItem>();

        // TASK / CALL (TaskSubtype)
        if (wantTask || wantCall) {
            String tSoql = 'SELECT Id, Subject, ActivityDate, TaskSubtype, WhatId ' +
                           'FROM Task WHERE WhatId = :recordId' + taskDateFilter +
                           ' WITH SECURITY_ENFORCED LIMIT 500';
            for (Task t : Database.query(tSoql)) {
                if (t.TaskSubtype == 'Email') continue; // exclude email-like tasks

                String mapped = (t.TaskSubtype == 'Call') ? 'Call' : 'Task';
                if ((mapped == 'Task' && !wantTask) || (mapped == 'Call' && !wantCall)) continue;

                ActivityItem ai = new ActivityItem();
                ai.id = t.Id;
                ai.type = mapped;
                ai.subject = t.Subject;
                ai.whenAt = Datetime.newInstance(t.ActivityDate, Time.newInstance(9, 0, 0, 0));
                out.add(ai);
            }
        }

        // EVENTS
        if (wantEvent) {
            String eSoql = 'SELECT Id, Subject, StartDateTime, IsAllDayEvent, ActivityDate, WhatId ' +
                           'FROM Event WHERE WhatId = :recordId' + eventDateFilter +
                           ' WITH SECURITY_ENFORCED LIMIT 500';
            for (Event e : Database.query(eSoql)) {
                ActivityItem ai = new ActivityItem();
                ai.id = e.Id;
                ai.type = 'Event';
                ai.subject = e.Subject;
                ai.whenAt = e.IsAllDayEvent
                    ? Datetime.newInstance(e.ActivityDate, Time.newInstance(9, 0, 0, 0))
                    : e.StartDateTime;
                out.add(ai);
            }
        }

        // EMAILMESSAGE
        if (wantEmail) {
            String mSoql = 'SELECT Id, Subject, MessageDate, RelatedToId ' +
                           'FROM EmailMessage WHERE RelatedToId = :recordId' + emailDateFilter +
                           ' WITH SECURITY_ENFORCED LIMIT 500';
            for (EmailMessage em : Database.query(mSoql)) {
                ActivityItem ai = new ActivityItem();
                ai.id = em.Id;
                ai.type = 'Email';
                ai.subject = em.Subject;
                ai.whenAt = em.MessageDate;
                out.add(ai);
            }
        }

        out.sort(new Comparator());
        return out;
    }

    private class Comparator implements System.Comparator<ActivityItem> {
        public Integer compare(ActivityItem a, ActivityItem b) {
            if (a.whenAt == b.whenAt) return 0;
            return (a.whenAt < b.whenAt) ? -1 : 1;
        }
    }
}
