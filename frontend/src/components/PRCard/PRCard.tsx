import React from "react";
import "./PRCard.css";

interface Props {
  name: string;
  muscle: string;
  weight: number;
  reps: number;
  date: string;
  image?: string;
}

export default function PRCard({ name, muscle, weight, reps, date, image }: Props) {
  return (
    <div className="prcard">
      
      {/* Image */}
      <div className="prcard-img-wrapper">
        {image ? (
          <img src={image} alt={name} className="prcard-img"/>
        ) : (
          <div className="prcard-img placeholder" />
        )}
      </div>

      {/* Content */}
      <div className="prcard-content">
        <div className="prcard-header">
          <h3 className="prcard-title">{name}</h3>
          <span className="prcard-muscle">{muscle.toUpperCase()}</span>
        </div>

        <div className="prcard-prvalue">
          <span className="pr-number">{weight} kg</span>
          <span className="pr-multiply">×</span>
          <span className="pr-number">{reps}</span>
        </div>

        <div className="prcard-date">
          Achieved on <strong>{new Date(date).toLocaleDateString()}</strong>
        </div>
      </div>

    </div>
  );
}
