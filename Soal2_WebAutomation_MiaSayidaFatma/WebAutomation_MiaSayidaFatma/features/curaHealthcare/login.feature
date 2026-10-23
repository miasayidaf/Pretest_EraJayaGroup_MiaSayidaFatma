Feature: Login Negative and Positive Case

    Background: User login to CURA Healthcare Service
        Given User is on the CURA Healthcare Service login page

    @TC_1_1 @negative
    Scenario: Login with invalid data
        When User input invalid username "miasayidaf"
        And User input invalid password "pretestQA"
        And User clicks the Login button
        Then User fails to login
        And the error message "Login failed! Please ensure the username and password are valid." is displayed
        
    @TC_1_2 @positive
    Scenario: Login with valid data
        When User input valid username "John Doe"
        And User input valid password "ThisIsNotAPassword"
        And User clicks the Login button
        Then User login successfully
        And User is redirected to the Make Appointment page