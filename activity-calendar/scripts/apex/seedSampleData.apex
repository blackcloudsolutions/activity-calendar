// Creates a demo Account with some activities this month
Account a = new Account(Name = 'Activity Calendar Demo');
insert a;

Date today = Date.today();

// Task (normal)
insert new Task(WhatId = a.Id, Subject = 'Follow-up', ActivityDate = today);

// Call (TaskSubtype=Call)
insert new Task(WhatId = a.Id, Subject = 'Call prospect', ActivityDate = today.addDays(1), TaskSubtype = 'Call');

// Event (timed: 60 min)
Datetime start = Datetime.now().addDays(2);
insert new Event(
    WhatId = a.Id,
    Subject = 'Demo call',
    StartDateTime = start,
    EndDateTime = start.addMinutes(60),
    IsAllDayEvent = false
);

// EmailMessage
insert new EmailMessage(RelatedToId = a.Id, Subject = 'Welcome email', MessageDate = Datetime.now().addDays(3), Status = '3');

System.debug('Seeded Account Id: ' + a.Id);
