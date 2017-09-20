// @flow
import React from 'react'

import styles from './Spinner.sss'

const Spinner = ({ style = {}, label }: { label: string, style: Object }) => (
  <div style={style}>
    {label && <div style={{ textAlign: 'center' }}>{label}</div>}
    <div className={styles.spinner}>
      <div />
    </div>
  </div>
)

export default Spinner
