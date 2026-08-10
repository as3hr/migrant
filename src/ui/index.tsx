import { Box, render, Text } from 'ink';
import TextInput from 'ink-text-input';
import React from 'react';

class Greeting extends React.Component {
  state = {
    name: '',
  };

  onChange = (name: string) => {
    this.setState({ name });
  };

  render() {
    return (
      <Box>
        <Box marginRight={1} backgroundColor='blue'> 
          <Text>What's your name?</Text>
        </Box>

        {this.state.name ? (
			<Text  backgroundColor='green'>Hello {this.state.name}</Text>
        ) : (
          <TextInput value={this.state.name} onChange={this.onChange} />
        )}
      </Box>
    );
  }
}

render(<Greeting />);