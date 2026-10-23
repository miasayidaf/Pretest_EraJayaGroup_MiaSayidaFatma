Feature: Eraspace Mobile Login Negative and Positive Case

    Background:
      Given User is on the Eraspace mobile login page

    @TC_1_1 @negative
    Scenario: Login with invalid data
      When User inputs invalid username
      And User inputs invalid password
      And User clicks the Login button
      Then User fails to login on Eraspace
      And an Eraspace login error message is displayed

    @TC_1_2 @positive
    Scenario: Login with valid data
      When User inputs valid username
      And User inputs valid password
      And User clicks the Login button
      Then User login successfully on Eraspace
      And User is redirected to the Eraspace homepage
      And User can see the menu list
      And User can see the account name
      And User can see the point list