/* eslint-disable no-unused-vars */
import { skills as initialSkills } from "@/app/data/data";
import { NextResponse } from "next/server";

let skillsData = initialSkills.map((s) => ({
  name: s.name,
  color: s.color,
}));

export async function GET() {
  return NextResponse.json(skillsData);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Skill name is required" },
        { status: 400 }
      );
    }

    const newSkill = {
      name,
      color: color || "#ffffff",
    };

    skillsData.push(newSkill);

    return NextResponse.json(
      { message: "Skill added successfully", skill: newSkill },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}