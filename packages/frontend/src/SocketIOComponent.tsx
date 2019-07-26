import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import uuidv4 from 'uuid/v4';
import { Input, Button, Label, FormGroup, InputGroup, InputGroupAddon } from 'reactstrap';
import { Event } from 'shared/dist/enums';

const url = `http://${window.location.hostname}:3001/`;

// We can't place this inside the FC else it'll be called everytime
const socket = io(url, { transports: ['websocket']});

let sessionStorageID = window.sessionStorage.getItem('id');
if (!sessionStorageID) {
  sessionStorageID = uuidv4();
  window.sessionStorage.setItem('id', sessionStorageID);
}

// I "redefine" this function so that I have a default timeout, and a better function name
const delay = (fn: () => void, ms = 200) => {
  setTimeout(fn, ms);
}

const SocketIOComponent: React.FC = () => {
  const [socketID, setSocketId] = useState();
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [clientRooms, setClientRooms] = useState<string[]>([]);
  const roomRef = useRef<HTMLInputElement | null>(null);

  // goal is to call these only once
  useEffect(() => {
    // Also gest called on reconnect
    socket.on('connect', () => {
      socket.emit(Event.SET_SESSION_ID, sessionStorageID);
      socket.emit(Event.ROOMS);
      console.log(`connect`);

      // We delay this because we want it to appear
      delay(() => {
        messages.push('connect');
        setSocketId(socket.id);
        setMessages(messages);
      });
    });

    // Where should this logic be?
    // Should the client just pass "expected" list of rooms and et the server handle it?
    // Seems like a cleaner approach than putting the logic in the client
    const synchronizeRooms = (serverRooms: string[]) => {
      const roomsToJoin = clientRooms.filter(clientRoom => !serverRooms.includes(clientRoom));
      const roomsToLeave = serverRooms.filter(serverRoom => !clientRooms.includes(serverRoom));

      roomsToJoin.forEach(room => socket.emit(Event.JOIN_ROOM, room));
      roomsToLeave.forEach(room => socket.emit(Event.LEAVE_ROOM, room));
      // socket.emit(Event.JOIN_ROOM, ...roomsToJoin);
      // socket.emit(Event.LEAVE_ROOM, ...roomsToLeave);
    }

    socket.on(Event.ROOMS, (serverRooms: string[]) => {
      synchronizeRooms(serverRooms);
    })

    socket.on('connect_error', (error: any) => {
      console.log(`connect_error: ${error}`);
    })

    socket.on('connect_timeout', (timeout: any) => {
      console.log(`connect_timeout: ${timeout}`);
    })

    socket.on('error', (error: any) => {
      console.log(`error: ${error}`);
    })

    socket.on('disconnect', (reason: any) => {
      console.log(`disconnect: ${reason}`);
    })

    socket.on('reconnect', (attemptNumber: any) => {
      console.log(`reconnect: attemptNumber: ${attemptNumber}`);
    })

    socket.on('reconnect_attempt', (attemptNumber: any) => {
      console.log(`reconnect_attempt: attemptNumber: ${attemptNumber}`);
    })

    socket.on('reconnecting', (attemptNumber: any) => {
      console.log(`reconnecting: attemptNumber: ${attemptNumber}`);
    })

    socket.on('reconnect_error', (error: any) => {
      console.log(`reconnect_error: ${error}`);
    })

    socket.on('reconnect_failed', (error: any) => {
      console.log(`reconnect_failed: ${error}`);
    })

    socket.on('message', (message: string) => {
      messages.push(message);
      setMessages(messages);
    });

    socket.on('ping', () => {
      console.log('ping');
    });

    socket.on('pong', (latency: number) => {
      console.log(`pong: ${latency}`);
    });
  });

  const messagesElement = messages.map((message, index) => {
    return <li key={index}>{message}</li>;
  });

  const joinRoom = () => {
    const current = roomRef.current;
    if (!current) {
      return;
    }
    const newRoom = current.value.trim();
    socket.emit(Event.JOIN_ROOM, newRoom);
    const newClientRooms = Array.from(clientRooms);
    newClientRooms.push(newRoom);
    setClientRooms(newClientRooms);
  }

  const onSubmit = () => {
    socket.send(value);
  }

  const roomsElement = clientRooms.map((room) => {
    return (
      <li key={room}>
        {room} 
      </li>
    );
  })

  return (
    <>
      <FormGroup>
        <Label for="socketID">Socket ID:</Label>
        <Input
          defaultValue={socketID}
          onChange={e => setSocketId(e.target.value.trim())}
          readOnly
        />
      </FormGroup>
      <FormGroup>
        <Label for="room">Room:</Label>
        <InputGroup>
          <Input
            innerRef={roomRef}
          />
          <InputGroupAddon addonType="append"><Button onClick={() => joinRoom()}>Join Room</Button></InputGroupAddon>
        </InputGroup>
      </FormGroup>
      <FormGroup>
        <Label for="room">Rooms:</Label>
        <ul>{roomsElement}</ul>
      </FormGroup>
      <FormGroup>
        <Label for="message">Message</Label>
        <Input
          type="textarea"
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={value.split("\n").length + 2}
        />
      </FormGroup>
      <FormGroup>
        <Button onClick={onSubmit}>Submit</Button>
      </FormGroup>
      <ol>
        {messagesElement}
      </ol>
    </>
  );
}

export default SocketIOComponent;