const express = require('express')
const app = express()
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// routing our landing page to login.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

/*

What I'm doing below is that I'm using different addresses to identify different user. 
Notice that for both users below, I am returning the same html file. 
By getting the client to read the address, the client can parse out who the use is supposed to be. 
Note that this is a naive and unsecure way of doing it. While many websites uses the principle, 
there's a lot more network security magic that goes on in the background in thsoe cases.

*/

var name;

var orderLog = {
    burger1Visibility: false,
    burger2Visibility: false,
    burger3Visibility: false,
    burger4Visibility: false,
    sushi1Visibility: false,
    sushi2Visibility: false,
    sushi3Visibility: false,
    sushi4Visibility: false,
    // toroPicOpasity: 1
}

var sushiPicBool = true;

app.get('/chief', (req, res) => {            
    res.sendFile(__dirname + '/index.html');
});


app.get('/customer', (req, res) => {            
    res.sendFile(__dirname + '/index.html');
});


// connect the server to port 3000
http.listen(3000, () => {
    console.log('Started app on port 3000');
});

//when a client is connected
io.on('connection', (socket) => {
    socket.on('joinApp', (userName) => {
        name = userName;
        console.log(`a ${userName} has connected`);

        //Load recent order
        io.emit('orderLog', orderLog);
        console.log("loaded order")
});

    //forward data
    socket.on('orderChange', ({visibility, name}) => {
        console.log({visibility, name})
        for (let order in orderLog){
            if(order.includes(name)){
                console.log(order)
                if(name == "toroPic")
                  {
                    sushiPicBool = !sushiPicBool;
                    if(!sushiPicBool)
                      {
                       orderLog[order] = 0.5; 
                      }
                    else
                      {
                        orderLog[order] = 1;
                      }
                  }
                else
                  {
                   orderLog[order] = visibility; 
                  } 
              io.emit("orderLog", orderLog);
            }
        }
    });
  
    socket.on("confirmOrder", () => {
      io.emit("orderComplete");
    })
  
    socket.on("checkBurger", () => {
      io.emit("checkPlates", orderLog.burger1Visibility, orderLog.burger2Visibility, orderLog.burger3Visibility, orderLog.burger4Visibility, "burger")
    })
  
    socket.on("checkSushi", () => {
      io.emit("checkPlates", orderLog.sushi1Visibility, orderLog.sushi2Visibility, orderLog.sushi3Visibility, orderLog.sushi4Visibility, "sushi")
    })

    socket.on("orderReady", () => {
      io.emit("sendOrder")
    })
  
    //When a client disconnects 
    socket.on('disconnect', () => {
        console.log(`a ${name} has disconnected`);
    });
});