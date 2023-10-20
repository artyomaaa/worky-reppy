import React from "react";
import PropTypes from 'prop-types';

export default function SortArrows (props) {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={props.style}>
      <path d="M7.85266 2.14646L5.85267 0.146448C5.85257 0.146354 5.85248 0.146307 5.85241 0.146214C5.84083 0.134659 5.82869 0.123714 5.81604 0.113331C5.81025 0.108573 5.80415 0.104448 5.7982 0.099995C5.7911 0.0946747 5.78414 0.0891669 5.77673 0.0842216C5.76961 0.0794637 5.76222 0.0753388 5.75491 0.0709794C5.74821 0.0669716 5.74167 0.0627762 5.73478 0.0590731C5.72732 0.0550887 5.71968 0.0517137 5.71207 0.0481278C5.70487 0.0447294 5.69779 0.0411434 5.69043 0.0380731C5.68305 0.0350262 5.6755 0.0325419 5.668 0.02987C5.6601 0.0270341 5.65232 0.0240106 5.64426 0.0215731C5.63676 0.0192997 5.62912 0.0176356 5.62155 0.0157372C5.61332 0.0136512 5.60519 0.0113544 5.59682 0.00969031C5.58803 0.00795593 5.57918 0.00690125 5.57034 0.00563562C5.56305 0.00460437 5.55588 0.00319812 5.54847 0.00247156C5.51566 -0.000762817 5.48259 -0.000762817 5.44978 0.00247156C5.44239 0.00319812 5.43522 0.00458093 5.42791 0.00563562C5.41907 0.00690125 5.41019 0.00793249 5.40143 0.00969031C5.39303 0.0113544 5.38493 0.0136512 5.3767 0.0157372C5.36911 0.0176356 5.36149 0.0192997 5.35399 0.0215731C5.34593 0.0240106 5.33812 0.0270341 5.33025 0.02987C5.32275 0.0325653 5.3152 0.0350262 5.30782 0.0380731C5.30043 0.04112 5.29338 0.0447294 5.28618 0.0481278C5.27859 0.0517137 5.27093 0.0550887 5.26347 0.0590731C5.25658 0.0627762 5.25004 0.0669716 5.24334 0.0709794C5.23603 0.0753388 5.22864 0.0794637 5.22152 0.0842216C5.21411 0.0891669 5.20718 0.0946747 5.20005 0.099995C5.1941 0.104448 5.188 0.108573 5.18221 0.113331C5.16956 0.123714 5.15739 0.134659 5.14584 0.146214C5.14575 0.146307 5.14565 0.146354 5.14558 0.146448L3.14559 2.14644C2.95033 2.3417 2.95033 2.65829 3.14559 2.85355C3.34085 3.04881 3.65744 3.04881 3.8527 2.85355L4.99914 1.7071V7.50001C4.99914 7.77615 5.223 8 5.49914 8C5.77528 8 5.99913 7.77615 5.99913 7.50001V1.70713L7.14557 2.85357C7.34083 3.04883 7.65743 3.04883 7.85268 2.85357C8.04792 2.65829 8.04792 2.34172 7.85266 2.14646Z" fill={props.fill}/>
      <path d="M4.14631 9.14645L2.99987 10.2929V4.50001C2.99987 4.22387 2.77602 4.00002 2.49987 4.00002C2.22373 4.00002 1.99988 4.22387 1.99988 4.50001V10.2929L0.853433 9.14645C0.658174 8.95119 0.34158 8.95119 0.146322 9.14645C-0.0489366 9.34171 -0.0489366 9.6583 0.146322 9.85356L2.14632 11.8536C2.14641 11.8537 2.14651 11.8537 2.1466 11.8538C2.15815 11.8653 2.17032 11.8763 2.18295 11.8867C2.18874 11.8914 2.19486 11.8956 2.20081 11.9C2.20791 11.9054 2.21487 11.9109 2.22226 11.9158C2.22938 11.9206 2.23676 11.9247 2.24408 11.929C2.25078 11.9331 2.25732 11.9373 2.26421 11.9409C2.27166 11.9449 2.27933 11.9483 2.28694 11.9519C2.29412 11.9553 2.30119 11.9589 2.30855 11.9619C2.31594 11.965 2.32348 11.9674 2.33098 11.9701C2.33888 11.9729 2.34666 11.976 2.35473 11.9784C2.36223 11.9807 2.36984 11.9823 2.37744 11.9842C2.38566 11.9863 2.3938 11.9886 2.40219 11.9903C2.41098 11.992 2.41983 11.9931 2.42867 11.9943C2.43596 11.9954 2.44316 11.9968 2.45054 11.9975C2.48335 12.0007 2.51642 12.0007 2.54923 11.9975C2.55662 11.9968 2.56379 11.9954 2.5711 11.9943C2.57994 11.9931 2.58882 11.992 2.59759 11.9903C2.60598 11.9886 2.61409 11.9863 2.62231 11.9842C2.62991 11.9823 2.63752 11.9807 2.64502 11.9784C2.65308 11.9759 2.66089 11.9729 2.66876 11.9701C2.67626 11.9674 2.68381 11.9649 2.69119 11.9619C2.69855 11.9588 2.70561 11.9553 2.71278 11.9519C2.7204 11.9483 2.72809 11.9449 2.73554 11.9409C2.74241 11.9372 2.74894 11.933 2.75562 11.929C2.76294 11.9247 2.77034 11.9205 2.77747 11.9158C2.78485 11.9108 2.79179 11.9053 2.79887 11.9C2.80484 11.8956 2.81096 11.8914 2.81677 11.8867C2.82931 11.8764 2.84138 11.8655 2.85287 11.854C2.85305 11.8539 2.85324 11.8537 2.85341 11.8535L4.8534 9.85354C5.04866 9.65828 5.04866 9.34169 4.8534 9.14643C4.65814 8.95117 4.3416 8.95119 4.14631 9.14645Z" fill={props.fill}/>
    </svg>
  )
}
SortArrows.defaultProps = {
  fill: '#fff',
  style: {}
};
SortArrows.propTypes = {
  style: PropTypes.object,
  fill: PropTypes.string
};
