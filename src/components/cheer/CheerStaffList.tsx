import type { CheerStaffMember, CheerStaffRole } from "@/lib/types";
import styles from "./CheerStaffList.module.css";

const ROLE_ORDER: CheerStaffRole[] = ["응원단장", "부응원단장", "장내아나운서", "치어리더"];

export default function CheerStaffList({ staff }: { staff: CheerStaffMember[] }) {
  if (staff.length === 0) {
    return <p className={styles.empty}>응원단 정보가 없어요.</p>;
  }

  return (
    <div className={styles.groups}>
      {ROLE_ORDER.map((role) => {
        const members = staff.filter((member) => member.role === role);
        if (members.length === 0) return null;
        return (
          <div key={role} className={styles.group}>
            <p className={styles.role}>{role}</p>
            <ul className={styles.names}>
              {members.map((member) => (
                <li key={member.name} className={styles.name}>
                  {member.name}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
