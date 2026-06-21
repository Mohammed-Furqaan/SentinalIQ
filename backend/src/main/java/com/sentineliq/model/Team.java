package com.sentineliq.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String name;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "team_members",
        joinColumns = @JoinColumn(name = "team_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();

    public Team() {}

    public Team(Long id, String name, List<User> members) {
        this.id = id;
        this.name = name;
        this.members = members != null ? members : new ArrayList<>();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<User> getMembers() { return members; }
    public void setMembers(List<User> members) { this.members = members; }

    public static TeamBuilder builder() {
        return new TeamBuilder();
    }

    public static class TeamBuilder {
        private Long id;
        private String name;
        private List<User> members = new ArrayList<>();

        public TeamBuilder id(Long id) { this.id = id; return this; }
        public TeamBuilder name(String name) { this.name = name; return this; }
        public TeamBuilder members(List<User> members) { this.members = members; return this; }

        public Team build() {
            return new Team(id, name, members);
        }
    }
}
