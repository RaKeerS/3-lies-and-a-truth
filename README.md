# 3LiesAndATruth 🃏

This is my implementation of a card game which is based on the principle of determining which amongst the provided options are lies or truth.

The game is based on the principle of determining which options could be lies and which of them is the truth. The game provides the player a set of 4 options and let's them determine either the 3 lies or 1 truth amongst these options.

A player needs to pick the appropriate options i.e. either 3 lies or 1 truth. Picking the correct option would sustain the cards they hold and picking an incorrect option would destroy those cards. Also, you'd lose your bounty amount! 😥 But, if your win! you retain your cards from being destroyed while also winning the bounty amount of your opponent! 🤑

The game continues until the deck runs out of cards or until one of the player quits, in which case the player having the most bounty amount would win! 🏆

You also get 4 lifelines to utilize a special option which is to have a look at the discarded cards which gets destroyed each time a player loses a round (called the Voided Cards). This allows the player to evaluate the option they wish to choose with a little more accuracy and logic. Having the knowledge of what cards have already been discarded so far + the cards in your section = better insight of what options being provided in current game phase could be false! 💭🤔

## Technologies Used

This game is developed using [<u>***Angular (v17)***</u>](https://v17.angular.io/start) primarily as framework. And also makes use of [<u>***PrimeNg UI Webkit***</u>](https://primeng.org/) for aesthetics and design. It also makes use of [<u>***WebRTC (Web Real-Time Communications)***</u>](https://webrtc.org/) which is an open source project that enables real-time voice, text and video communications capabilities between web browsers and devices.

The library I referred to in particular for leveraging WebRTC is -
[<u>***PeerJS***</u>](https://peerjs.com/)

### WebRTC (PeerJS)
PeerJS wraps the browser's WebRTC implementation to provide a complete, configurable, and easy-to-use peer-to-peer connection API. Equipped with nothing but an ID, a peer can create a P2P data or media stream connection to a remote peer. 


### Project Dependencies
- Angular v17
- PeerJS
- PrimeNG

## Working Demo Video of the Application


## Screen-grabs of the Application

1. Login Screen

2. Connection Established

3. Playground Rules

4. Toss

5. Set Bounty Amount

6. Deck Shuffling

7. Game Commences

8. Game play screenshots


## License

This project is licensed under the MIT License.
