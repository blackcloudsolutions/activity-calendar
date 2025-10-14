@IsTest
private class BCAC_ActivityControllerTest {

    @IsTest
    static void test_AllTypes_FilteringAndExclusions() {
        Id accId = BCAC_TestDataFactory.createAccount();
        Date today = Date.today();

        // Tasks
        BCAC_TestDataFactory.makeTask(accId, today, null,    'Follow-up');          // Task
        BCAC_TestDataFactory.makeTask(accId, today, 'Call',  'Call with client');   // Call
        BCAC_TestDataFactory.makeTask(accId, today, 'Email', 'Email-like task');    // EXCLUDED

        // Event
        BCAC_TestDataFactory.makeEvent(accId, Datetime.now().addHours(2), 'Demo', false);

        // EmailMessage
        BCAC_TestDataFactory.makeEmail(accId, Datetime.now().addMinutes(30), 'Proposal sent');

        Test.startTest();
        List<String> types = new List<String>{ 'Task', 'Call', 'Event', 'Email' };
        List<BCAC_ActivityController.ActivityItem> items =
            BCAC_ActivityController.getActivities(accId, today.addDays(-1), today.addDays(1), types);
        Test.stopTest();

        Boolean sawTask = false, sawCall = false, sawEvent = false, sawEmail = false;
        for (BCAC_ActivityController.ActivityItem it : items) {
            if (it.type == 'Task')  sawTask  = true;
            if (it.type == 'Call')  sawCall  = true;
            if (it.type == 'Event') sawEvent = true;
            if (it.type == 'Email') sawEmail = true;
        }

        System.assertEquals(true, sawTask,  'Should include a normal Task');
        System.assertEquals(true, sawCall,  'Should include a Call (TaskSubtype=Call)');
        System.assertEquals(true, sawEvent, 'Should include Event');
        System.assertEquals(true, sawEmail, 'Should include EmailMessage');
    }

    @IsTest
    static void test_DateRange_And_TypeSubset() {
        Id accId = BCAC_TestDataFactory.createAccount();
        Date today = Date.today();

        // Out of range
        BCAC_TestDataFactory.makeTask(accId, today.addDays(-10), null, 'Old Task');
        // In range
        BCAC_TestDataFactory.makeTask(accId, today, null, 'Today Task');

        Test.startTest();
        List<BCAC_ActivityController.ActivityItem> items =
            BCAC_ActivityController.getActivities(
                accId,
                today.addDays(-1),
                today.addDays(1),
                new List<String>{ 'Task' }
            );
        Test.stopTest();

        System.assertEquals(1, items.size(), 'Only the in-range Task should be returned');
        System.assertEquals('Task', items[0].type, 'Returned type should be Task');
    }
}
