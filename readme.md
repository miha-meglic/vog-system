## A VERY simple inventory management system

A simple firebase application I built for my grandma, who is a bit of a hoarder (I guess that's where I get it from :wink:), to keep track of all of the things she has.  
It's basically just a stripped down version of my full IMS System.

### Installation

1. To try it out just clone the repo, and deploy it with the Firebase CLI to your own project.  
2. To get admin privileges create an email account in the Firebase web console, copy your users UID and add it to the config with the following command:  
	```bash
	firebase functions:config:set admin.uid="YOUR_UID"
	```
3. You can then call the firebase functions 'promoteToUser' and 'promoteToAdmin'.  
	!! Make sure to pass the 'email' and 'displayName' as parameters in a dictionary !!
	```javascript
	var promoteToAdmin = firebase.functions().httpsCallable('promoteToAdmin');
	promoteToAdmin({email: 'YOUR_EMAIL', displayName: 'YOUR_DISPLAY_NAME'});
	```
	You can do this from the developer console in your browser on either the login or system main page.

More info in the [official Firebase documentation](https://firebase.google.com/docs/web/setup).