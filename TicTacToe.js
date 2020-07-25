import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  PLAYER_X,
  PLAYER_O,
  SQUARE_DIMS,
  DRAW,
  GAME_STATES,
  DIMS,
  GAME_MODES
} from "./constants";
import Board from "./Board";
import { getRandomInt, switchPlayer } from "./utils";
import { minimax } from "./minimax";
import { ResultModal } from "./ResultModal";
import { border } from "./styles";

const arr = new Array(DIMS ** 2).fill(null);
const board = new Board();

let score_1=0;
let score_2=0;
let switchScoreBoard = false;

const TicTacToe = ({ squares = arr }) => {
  const [players, setPlayers] = useState({ human: null, computer: null, Friend:null});
  const [gameState, setGameState] = useState(GAME_STATES.notStarted);
  const [grid, setGrid] = useState(squares);
  const [winner, setWinner] = useState(null);
  const [nextMove, setNextMove] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('Friend');
  const [users,setUser] = useState({ player_1:''});
  const [rivals,setRival] = useState({player_2:'' });

  /**
   * On every move, check if there is a winner. If yes, set game state to over and open result modal
   */
  useEffect(() => {
    const winner = board.getWinner(grid);
    const declareWinner = winner => {
      let winnerStr;
      switch (winner) {
        case PLAYER_X:
          winnerStr = "Player X wins!";
          break;
        case PLAYER_O:
          winnerStr = "Player O wins!";
          break;
        case DRAW:
        default:
          winnerStr = "It's a draw";
      }
      setGameState(GAME_STATES.over);
      setWinner(winnerStr);
      // Slight delay for the modal so there is some time to see the last move
      setTimeout(() => setModalOpen(true), 300);
    };

    if (winner !== null && gameState !== GAME_STATES.over) {
      declareWinner(winner);
    }
  }, [gameState, grid, nextMove]);

  /**
   * Set the grid square with respective player that made the move. Only make a move when the game is in progress.
   * useCallback is necessary to prevent unnecessary recreation of the function, unless gameState changes, since it is
   * being tracked in useEffect
   * @type {Function}
   */
  const move = useCallback(
    (index, player) => {
      if (player && gameState === GAME_STATES.inProgress) {
        setGrid(grid => {
          const gridCopy = grid.concat();
          gridCopy[index] = player;
          return gridCopy;
        });
      }
    },
    [gameState]
  );

  /**
   * Make computer move. If it's the first move (board is empty), make move at any random cell to skip
   * unnecessary minimax calculations
   * @type {Function}
   */
  const computerMove = useCallback(() => {
    // Important to pass a copy of the grid here
    const board = new Board(grid.concat());
    const emptyIndices = board.getEmptySquares(grid);
    let index;
    switch (mode) {
      case GAME_MODES.easy:
        do {
          index = getRandomInt(0, 8);
        } while (!emptyIndices.includes(index));
        break;
      case GAME_MODES.medium:
        // Medium level is basically ~half of the moves are minimax and the other ~half random
        const smartMove = !board.isEmpty(grid) && Math.random() < 0.5;
        if (smartMove) {
          index = minimax(board, players.computer)[1];
        } else {
          do {
            index = getRandomInt(0, 8);
          } while (!emptyIndices.includes(index));
        }
        break;
      case GAME_MODES.difficult:
      default:
        index = board.isEmpty(grid)
          ? getRandomInt(0, 8)
          : minimax(board, players.computer)[1];
    }
    if (!grid[index]) {
      move(index, players.computer);
      setNextMove(players.human);
    }
  }, [move, grid, players, mode]);

  /**
   * Make computer move when it's computer's turn
   */
  useEffect(() => {
    let timeout;
    if (
      nextMove !== null &&
      nextMove === players.computer &&
      gameState !== GAME_STATES.over
    ) {
      // Delay computer moves to make them more natural
      timeout = setTimeout(() => {
        computerMove();
      }, 500);
    }
    return () => timeout && clearTimeout(timeout);
  }, [nextMove, computerMove, players.computer, gameState]);
  
  const humanMove = index => {
      if(mode!== 'Friend'){
      if (!grid[index] && nextMove === players.human) {
        move(index, players.human);
        setNextMove(players.computer);
      }
    }
    else{
      if(!grid[index] && nextMove === players.human){
        move(index, players.human);
        setNextMove(players.Friend);
      }
      else if (!grid[index] && nextMove === players.Friend) {
        move(index, players.Friend);
        setNextMove(players.human);
      }
    }
  };

  const choosePlayer = option => {
    if(option === 2){
      switchScoreBoard = true;
    }
    else{
      switchScoreBoard = false;
    }
    if(mode!=='Friend'){
      setPlayers({ human: option, computer: switchPlayer(option) });
      setRival({player_2:'AI'});       
    }
    else{
      setPlayers({ human: option, Friend: switchPlayer(option) });
      setRival({player_2:''});  
    }
    setGameState(GAME_STATES.started);
    setNextMove(PLAYER_X);
  };


  const startNewGame = () => {
    score_1 =0;
    score_2 =0;;
    setGameState(GAME_STATES.notStarted);
    setGrid(arr);
    setModalOpen(false);
  };

  const closeNewGame = () =>{
    if(winner === 'Player X wins!'){
      score_1 = score_1+1;
    }
    if(winner === 'Player O wins!'){
      score_2 = score_2+1;
    }
    setGameState(GAME_STATES.inProgress);
    setGrid(arr);
    setModalOpen(false);
  }

  
  const changeMode = e => {    
    setMode(e.target.value);
    setGameState(GAME_STATES.modeSelected);
  };

  const myChangeHandlerPlayer1 = (event) => {
    let val = event.target.value;
    setUser({ player_1 : val})
  }
  const myChangeHandlerPlayer2 = (event) =>{
      let val = event.target.value;
      setRival({player_2:val})    
  }

  const startGame = () => {
    if(users.player_1!=='' && rivals.player_2!=='')
    setGameState(GAME_STATES.inProgress);
    setNextMove(PLAYER_X);
  }

  return gameState === GAME_STATES.notStarted ? (
    <Screen>
    <h2>Tic Tac Toe</h2>
        <span id="x" className='header-x-image'>X</span>
        <div className="outer header-image"><div className="inner">&nbsp;</div></div>
      
      <Inner>
        <ChooseText><strong>Choose you play mode</strong></ChooseText>
          {Object.keys(GAME_MODES).map(key => {
            const gameMode = GAME_MODES[key];
            return (
                <button id={key} onClick={changeMode} key={gameMode} value={gameMode}>{key}</button>
            );
          })}
        </Inner>
    </Screen>
  ) : gameState === GAME_STATES.modeSelected ? (
  <Inner>

  <ChooseText><strong>Pick your side</strong></ChooseText>
  <ButtonRow>
    <button id='X' onClick={() => choosePlayer(PLAYER_X)}><span id="x" className='header-x-image-box'>X</span></button>
    <p id='or'>or</p>
    <button id='O' onClick={() => choosePlayer(PLAYER_O)}><div className="outer-box"><div className="inner-box">&nbsp;</div> </div> </button>
  </ButtonRow>
</Inner> 
  ) : gameState === GAME_STATES.started ? (
    <form className='showFormPlayerInput'>
      <label>Player 1:
      <input type='text' id='player_1' name='player_1' placeholder='Player X...' onChange={myChangeHandlerPlayer1}>
      </input> 
      </label>   
       <label>Player 2:
       <input type='text' id='player_2' name='player_2' placeholder={rivals.player_2==='AI'?'AI':'player O...'} disabled={rivals.player_2==='AI'} onChange={myChangeHandlerPlayer2}>
       </input>     
       </label>  
       <button type='button' onClick={startGame}>Continue</button>
    </form> 
  ) : (

    <React.Fragment>

    <h2>Tic Tac Toe</h2>
    
    <ul className='matchPlayers'>
      <li className='home_player'>
        {users.player_1}
      </li>
      <li className='rival_player'>
        {rivals.player_2}
      </li>
    </ul>
    <ul className='matchPlayers'>
    { switchScoreBoard ?<React.Fragment> <li className='home_player'>{score_2}</li><li className='rival_player'>{score_1}</li></React.Fragment> : <React.Fragment> <li className='home_player'>{score_1}</li><li className='rival_player'>{score_2}</li> </React.Fragment> }
    </ul>
  
    <Container dims={DIMS}>
      {grid.map((value, index) => {
        const isActive = value !== null;
        return (
          <Square
            data-testid={`square_${index}`}
            key={index}
            onClick={() => humanMove(index)}
          >
            {isActive && <Marker>{value === PLAYER_X ? <span id="x" className='header-x-image-board'>X</span> : <div className="outer"><div className="inner">&nbsp;</div></div>}</Marker>}
          </Square>
        );
      })}
      <Strikethrough
        styles={
          gameState === GAME_STATES.over && board.getStrikethroughStyles()
        }
      />
      <ResultModal
        isOpen={modalOpen}
        winner={winner}
        close={closeNewGame}
        startNewGame={startNewGame}
      />
    </Container>
    </React.Fragment>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  width: ${({ dims }) => `${dims * (SQUARE_DIMS + 5)}px`};
  flex-flow: wrap;
  position: relative;
`;

const Square = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${SQUARE_DIMS}px;
  height: ${SQUARE_DIMS}px;
  ${border};

  &:hover {
    cursor: pointer;
  }
`;

Square.displayName = "Square";

const Marker = styled.div`
  font-size: 68px;
`;

const ButtonRow = styled.div`
  display: flex;
  width: 150px;
  justify-content: space-between;
`;

const Screen = styled.div``;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;
const ChooseText = styled.p``;

const Strikethrough = styled.div`
  position: absolute;
  ${({ styles }) => styles}
  background-color: indianred;
  height: 5px;
  width: ${({ styles }) => !styles && "0px"};
`;

export default TicTacToe;
