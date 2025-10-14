public class BCAC_TestDataFactory {
    public static Id createAccount() {
        Account a = new Account(Name = 'BCAC Test Account');
        insert a;
        return a.Id;
    }

    public static Task makeTask(Id whoOrWhat, Date d, String subtype, String subject) {
        Task t = new Task(WhatId = whoOrWhat, ActivityDate = d, Subject = subject);
        if (subtype != null) t.TaskSubtype = subtype; // e.g. 'Call' or 'Email'
        insert t; return t;
    }

    // If allDay=false, we set EndDateTime = start + 60 minutes (requirement: End or Duration)
    // If allDay=true, we set ActivityDate and IsAllDayEvent, no start/end times needed.
    public static Event makeEvent(Id whoOrWhat, Datetime start, String subject, Boolean allDay) {
        Event e = new Event(WhatId = whoOrWhat, Subject = subject);
        if (allDay) {
            e.IsAllDayEvent = true;
            e.ActivityDate = Date.newInstance(start.year(), start.month(), start.day());
        } else {
            e.IsAllDayEvent = false;
            e.StartDateTime = start;
            e.EndDateTime   = start.addMinutes(60);
        }
        insert e; return e;
    }

    public static EmailMessage makeEmail(Id relatedTo, Datetime whenAt, String subject) {
        EmailMessage em = new EmailMessage(
            RelatedToId = relatedTo,
            MessageDate  = whenAt,
            Subject      = subject,
            Status       = '3' // Sent
        );
        insert em; return em;
    }
}
