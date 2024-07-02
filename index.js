async function validateToken()
{
	token = document.getElementById( "token-input" ).value;

	// Try GETting current user endpoint
	// If status is 401, then token is invalid
	headers = {
		"Authorization": token,
		"Content-Type": "application/json"
	};
	
	response = await fetch( "https://discord.com/api/users/@me", { "headers": headers } );

	if ( !response.ok ) alert( `Invaid token provided (error ${response.status})` );
	else alert( "Valid token provided!" );
}