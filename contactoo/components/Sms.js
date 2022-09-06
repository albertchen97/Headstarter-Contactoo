import { React, useState } from "react";
import Modal from "react-modal";

export default function Sms({ smsIsOpen, setSmsIsOpen }) {
  const [text, setText] = useState("");
  const [recipientValue, setRecipientValue] = useState("");

  const onChangeHandler = (event) => {
    setRecipientValue(event.target.value);
  };

  const onChangeHandler2 = (event) => {
    setText(event.target.value);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const sendText = () => {
    if (recipientValue != "" && text != "") {
      fetch(
        `http://127.0.0.1:4000/send-text?recipient=${recipientValue}&textmessage=${text}`
      )
        .then((res) => res.json())
        .then(() => {
          this.setRecipientValue("");
          this.setText("");
        })
        .catch((err) => console.error(err));
      setText("");
      setRecipientValue("");
      setSmsIsOpen(false);
      refreshPage();
    }
  };

  return (
    <Modal
      overlayClassName={
        "z-30 flex justify-center items-center h-screen w-screen bg-black fixed top-0 bottom-0 left-0 right-0 bg-opacity-50 overflow-y-auto"
      }
      // styling for the actual modal window
      className={
        "absolute bg-white w-4/5 md:w-3/4 xl:2/3 z-40 max-w-4xl p-5 pt-20 rounded-2xl"
      }
      isOpen={smsIsOpen}
      onRequestClose={() => setSmsIsOpen(false)}>
      <div className="absolute top-10 right-5 md:right-10">
        <button
          className="text-3xl md:text-5xl"
          onClick={() => setSmsIsOpen(false)}>
          X
        </button>
      </div>
      {/* <div className="SMS">
        <div style={{ marginTop: 10 }}>
          <h2> Send Text Message </h2>
          <label> Your Phone Number </label>
          <br /> */}

      {/* sms form */}
      <form
        className="flex flex-col items-center justify-center w-full gap-5 text-xl md:text-2xl "
        onClick={sendText}>
        {/* greeting message */}
        <span className="text-3xl md:text-5xl">What can we help you with?</span>

        {/* recipient number input */}
        <div className="flex flex-col w-11/12 md:w-3/4 xl:w-2/3">
          Recipient Number
          <input
            className="w-full p-3 border-2 border-gray-500"
            type="text"
            name="recipient"
            onChange={onChangeHandler}
            value={recipientValue}
          />
        </div>

        {/* email input */}
        <div className="flex flex-col w-11/12 md:w-3/4 xl:w-2/3">
          Text
          <input
            className="w-full p-3 border-2 border-gray-500"
            type="text"
            name="text"
            rows="5"
            onChange={onChangeHandler2}
            value={text}
          />
        </div>

        {/* submit button */}
        <div className="flex justify-end w-11/12 mb-10 text-2xl md:text-3xl md:w-3/4 xl:w-2/3">
          <input
            className="p-5 text-white hover:cursor-pointer bg-cyan-600"
            type="submit"
            value="Submit"
            required
          />
        </div>
      </form>
    </Modal>
  );
}