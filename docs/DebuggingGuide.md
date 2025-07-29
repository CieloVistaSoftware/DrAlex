A debug system is an html element that put messages into a text area, last message is always on top.

The idea is that a flow of events is logged to tell us how things happend.  For our Claude widget, it received messages from the user (use a down arrow) and sends the post to claude server.  --> when clause responds <-- we should see the message and direction. When the user sees a response it should clearly indicate where it came from.

E.G. 
/login 4486 should show a down arrow and /login 4486,
then that message is sent either to an endpoint -> or to claude ->  
when the endpoint repsonds we should see <- either from claude or the endpoint. This way we are tracing the flow of information.
Finally when the client is notified an up arrow should show with the message.