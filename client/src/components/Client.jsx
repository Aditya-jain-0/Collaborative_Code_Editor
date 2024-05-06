import React from 'react';

const Client = ({ username }) => {
  return (
    <>
      {username && (
        <div className='client'>
          <span className='userName'>{username}</span>
        </div>
      )}
    </>
  );
};

export default Client;
