# 3 Lies And A Truth (A Card Game) 🃏

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

https://github.com/user-attachments/assets/aa30df3a-fec4-4551-9d31-2a58d1f6c6ef

## Screen-grabs of the Application

1. Login Screen
   
<img width="1280" alt="Login-Screen-4" src="https://github.com/user-attachments/assets/620c8f46-d695-4fc2-8848-4ae02a6cccd2">
<img width="1280" alt="Login-Screen-3" src="https://github.com/user-attachments/assets/3481cb64-9ab8-4f55-80a2-cf9907eacf9b">
<img width="1280" alt="Login-Screen-2" src="https://github.com/user-attachments/assets/88d3b144-888d-41e4-a21c-88f3728a2401">
<img width="1280" alt="Login-Screen-1" src="https://github.com/user-attachments/assets/e867ce05-aa0d-41b9-910b-03afeec13fe9">

2. Connection Established

<img width="1280" alt="Connection-Established" src="https://github.com/user-attachments/assets/cb1b0f5b-5e23-4628-a932-911341a8e1f6">

3. Playground Rules

<img width="1280" alt="Playerground-Rules-2" src="https://github.com/user-attachments/assets/664ebdc4-8699-4eac-a000-9c032ad36d98">
<img width="1280" alt="Playerground-Rules-1" src="https://github.com/user-attachments/assets/10a0add3-455e-4a6a-9e19-2df732fd794d">

4. Toss

<img width="1280" alt="Toss" src="https://github.com/user-attachments/assets/5795c6ec-7852-42c9-98b8-6529c014cad6">

5. Set Bounty Amount

<img width="1280" alt="Set-Bounty-Amount" src="https://github.com/user-attachments/assets/267e8aba-c6b6-4d5d-94ac-f8706b3244f6">

6. Deck Shuffling

<img width="1280" alt="Deck-Shuffling" src="https://github.com/user-attachments/assets/1dfc621e-622a-44f4-b564-2b664affe680">

7. Game Commences

<img width="1280" alt="Game-Commences" src="https://github.com/user-attachments/assets/06077c53-fdcc-477b-8d3a-1ec8c18cfaf0">

8. Game play screenshots

<img width="1280" alt="Gameplay-Screenshots-8" src="https://github.com/user-attachments/assets/2b67fb54-40fc-4b40-8f03-f0f7a75b3d1e">
<img width="1280" alt="Gameplay-Screenshots-7" src="https://github.com/user-attachments/assets/a684f408-6ef5-4b0d-abfe-c82f45bc0dac">
<img width="1280" alt="Gameplay-Screenshots-6" src="https://github.com/user-attachments/assets/fcabb334-9985-4bda-b9a7-f66829d34bc0">
<img width="1280" alt="Gameplay-Screenshots-5" src="https://github.com/user-attachments/assets/b928b1f6-42fb-484a-9006-2e5a0a657322">
<img width="1280" alt="Gameplay-Screenshots-4" src="https://github.com/user-attachments/assets/4429a6bf-8a03-4e27-8001-9b59f3b194e0">
<img width="1280" alt="Gameplay-Screenshots-3" src="https://github.com/user-attachments/assets/c592bcd1-114c-41f1-90f8-e96235004d53">
<img width="1280" alt="Gameplay-Screenshots-2" src="https://github.com/user-attachments/assets/e982f8bd-ad30-4e71-8801-a58cb47c0248">
<img width="1280" alt="Gameplay-Screenshots-1" src="https://github.com/user-attachments/assets/6e55e53e-c882-43d0-9676-52dc9a8b05db">

9. Check Voided Cards
 
<img width="1280" alt="Check-Voided-Cards-2" src="https://github.com/user-attachments/assets/0533b0b8-90bd-4a22-b8d9-12f1f681bda2">
<img width="1280" alt="Check-Voided-Cards-1" src="https://github.com/user-attachments/assets/909dd85a-d055-470a-84f2-b983c5c44973">

10. Quit Game
    
<img width="1280" alt="Quit-Game-2" src="https://github.com/user-attachments/assets/e6006d14-8ca9-48d2-9124-8609b0048959">
<img width="1280" alt="Quit-Game-1" src="https://github.com/user-attachments/assets/ff706640-b6b6-45cf-9148-8abf6cfdde75">


## License

This project is licensed under the MIT License.
