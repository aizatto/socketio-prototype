import React from 'react';
import { Container } from 'reactstrap';

import Navbar from './components/Navbar';
import SocketIOComponent from './SocketIOComponent';

const App: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      <Container className="pt-3 pb-5">
        <SocketIOComponent />
        <ul>
          <li><a href="https://socket.io/docs/server-api">server-api</a></li>
          <li><a href="https://socket.io/docs/client-api">client-api</a></li>
          <li><a href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/socket.io/">https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/socket.io/</a></li>
          <li><a href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/socket.io-client/">https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/socket.io-client/</a></li>
        </ul>
      </Container>
    </div>
  );
}

export default App;
