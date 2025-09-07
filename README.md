# Studentski-Prevozi
Studentski Prevozi was a multiple joint effort in which we created a car pooling website that incorporated different fields. This was a final college project between my three friends and me. It was a giant project that incorporated multiple external inserts and programming languages. Our assigment was not only to make a world class project but to try to "sell" the project to our professor. 

Design and Concept

The idea of the project was to create a car pooling web app that would be for student travels, in which students can easily navigate, search and find rides in the last minute. Design wise, the conceptual philosophy was to create a web app that would spark interest and mitigate one page visits in practice. It has to be responsive, sharp, modern but still unorthodox in a sense of not blending in the majority of todays sites. The color scheme consists of Black, Grey, Gold and Yellows hues, making it look rich, serious but still readable and easy to access.
Because students and young adult are prone to making choices and plans in the last minute, the speed of loading is a big thing on this app. Searching and loading had to be very fast to allow students to find their rides. 
Gradients and grain like transitions effect between colors add richness and character to the whole look of the app.

Functionality

Users have to option to book rides, cancel, search and offer rides themselves. Everything is dynamically stored in and written out of the database. After registrating/logging in, the user has full view of their profile, all of their rides which they booked and offered, as well as other personal information. Each ride has a map view from starting to final destination, it maps the trajectory using the Geolocation API. 
Upon completing rides, users have the option to rate it one through five stars. 
Administrators have the complete control over users, their personal information, rides, routes, enabling them to edit, delete, add new rides or users. 

Technical Bits

This project was done in Node, Express, SQL, Javascript, HTML, CSS, Bootstrap. We utilized Auth0 as an external help for web token and email confirmation. Geolocation API was used for mapping of rides. All of our files were made in the Model-View-Controller architecture, allowing us to see our errors more easily and make the debugging process faster and more efficient. 
The project runs on a local http-server as we had no requirement to host it online and a server file. During our development all of the changes and our advancements were uploaded to GitLab through commits. 



