# Ionic SPA with Authentication #
[![Build Status](https://travis-ci.org/y-a-n-n/IonicAuthenticatedApplication.svg?branch=master)](https://travis-ci.org/y-a-n-n/IonicAuthenticatedApplication)

This is the skeleton of an Ionic 4+ application which requires authentication of the user with a remote server before 
certain pages can be viewed. It uses an opinionated, event-based architecture which attempts to abstract business logic
from the UI via providers, and low-level interfaces (file system, persistent storage, network) via specific providers.

## Pages ##

All pages which should only be viewed by an authenticated user extend the AuthenticatedPage class. This class handles
platform pause and resume events, and translates them into generic onPause() and onResume() method calls which can be
overridden by the extending class/page. 

Provided the extending class provides a list of event subscriptions (IEventSubscription) to the base class via the 
AuthenticatedPage.subscriptions setter, the base class also handles subscribing and unsubscribing from events published
by providers.

The AuthenticatedPage class also checks that the user is logged in on every page resumption, and returns to the Login
Page if there is no current authenticated user. Finally, it provides convenience methods for displaying alerts and
Toast messages.

As much business logic and state as possible should be devolved into providers where possible, rather than existing in
pages.

## Providers ##

Providers contain business logic and maintain state for the lifetime of the application. Any state that must be persisted
across application restarts should be stored using the DataProvider, and re-loaded in the constructor or other relevant
initialisation method of the relevant downstream provider.

Providers communicate with each other and with pages via the ionic-angular Events bus as much as possible. Each provider
and page is responsible for subscribing and unsubscribing from appropriate events as required throughout its lifecycle. 

### DataProvider ###

The DataProvider allows for data to be persisted across application restarts. In general the DataProvider should only be
accessed/communicated with via other providers. If persisted data is required by a page, it should be provided to that 
page via an intermediate provider that loads the data at instantiation time and provides it to the page as required, 
providing appropriate type checking.

### AuthProvider ###

The AuthProvider stores information regarding the currently authenticated user, and communicates with the ApiProvider to
perform login and logout actions. It is configured username/password login and token-based authentication.

Once the user is logged in, the token is added as a header to outgoing requests to the application's server using a HTTP
Interceptor (see below)

### ApiProvider ###

The ApiProvider is an abstraction over the network layer. It exposes any methods necessary to communicate with remote 
devices asynchronously. In general, only providers (not pages) should communicate with the ApiProvider.

A HTTP interceptor is implemented in order to add an Authorization header to outgoing requests to the application server.
If a 401 UNAUTHORIZED response is returned to any authenticated request (i.e. the token is invalid or was revoked), the 
user is immediately logged out of the application and must re-authenticate. 


## Notes ##
TSLint rules to be fleshed out, in particular with regard to stricter type checking
