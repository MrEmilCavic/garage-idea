# Simple Web App with CRUD & search functionality
Hosting the backend (ASP.NET Core Web API) on Azure, using an SQL database.
After signing in (the password is hashed using salt, no plain text is stored in the database - have a look at the garage back end repo to see the code) you can:
create, read, update, delete databse entries.

## Disclaimer:
This is just a small example of how I like to code, this is by no means a project "ready to go live".

## Known issues:
Since the back-end is hosted on Azure and I use the free trial version running into 500, 50x errors is quite common.
Usually it means the web service needs a restart. If you'd like to play around with the page and you keep running into a 50x error let me know and I'll take care of it!
