Feature: Make Appointment Negative Case

    Background: User login to CURA Healthcare Service
        Given User is on the CURA Healthcare Service login page
        When User input valid username "John Doe"
        And User input valid password "ThisIsNotAPassword"
        And User clicks the Login button

    @TC_2_1 @negative
    Scenario: Make an appointment without the mandatory visit date
        When User selects facility "Tokyo CURA Healthcare Center"
        And User checks Apply for hospital readmission
        And User selects healthcare program "Medicare"
        And User input comment "Appointment without a visit date"
        And User clicks the Book Appointment button
        Then a validation message indicates that Visit Date is required