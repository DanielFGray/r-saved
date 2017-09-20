// @flow
import React from 'react'

import style from './Spinner.sss'

const Spinner = (props: { label: string }) => (
  <div>
    {props.label && <div style={{ textAlign: 'center' }}>{props.label}</div>}
    <div className={style.spinner}>
      <div />
    </div>
  </div>
)

export default Spinner
