"use client";

const Button = () => {
  const click = () => {
    console.log("Button clicked");
  };

  return <button onClick={click}>Click me</button>;
};

export default Button;
