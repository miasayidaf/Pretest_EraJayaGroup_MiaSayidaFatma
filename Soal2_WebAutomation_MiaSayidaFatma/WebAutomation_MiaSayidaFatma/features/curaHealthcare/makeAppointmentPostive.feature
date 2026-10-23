Feature: Make Appointment Positive Case

    Background: User login to CURA Healthcare Service
        Given User is on the CURA Healthcare Service login page
        When User input valid username "John Doe"
        And User input valid password "ThisIsNotAPassword"
        And User clicks the Login button

    @TC_2_2 @positive
    Scenario: Make an appointment successfully
        When User selects facility "Seoul CURA Healthcare Center"
        And User checks Apply for hospital readmission
        And User selects healthcare program "Medicaid"
        And User selects a Visit Date 7 days from today
        And User input comment "Successful appointment test"
        And User clicks the Book Appointment button
        Then User is redirected to the Appointment Confirmation page
        And Displayed facility is "Seoul CURA Healthcare Center"
        And Displayed hospital readmission is "Yes"
        And Displayed healthcare program is "Medicaid"
        And Displayed Visit Date matches the entered date
        And Displayed comment is "Successful appointment test"