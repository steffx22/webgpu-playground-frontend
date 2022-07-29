import { useState } from "react";
import './Gallery';

interface IProps {
  img: {
    src: string,
    uid: string,
    id: number,
    url: string,
    title: string
  }
}

export const ImageWrapper = ({ img } : IProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="img__wrap">        
      <img
        className="image_wrapper"
        alt={"Could not render shader"}
        src={img.url}
        onMouseOut={() => setHovered(false)}
        onMouseOver={() => setHovered(true)}
        style={{
          transform: `${hovered ? 'scale(1.03, 1.03)': ''}`,
        }}
      />
      <div
        className="img__description"
        onMouseOut={() => setHovered(false)}
        onMouseOver={() => setHovered(true)}
        style={{display: `${hovered ? 'flex': 'none'}`}}
      >
        <div className="img_description_title"
          onMouseOut={() => setHovered(false)}
          onMouseOver={() => setHovered(true)}
          style={{display: `${hovered ? 'block': 'none'}`}}
        >
          {img.title}
        </div>
      </div>
    </div>
    )
}

